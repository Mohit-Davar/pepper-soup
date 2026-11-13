# Interest Timing

## First-Day Interest

### First-Day Interest

First-day interest decides whether interest accrues on the disbursement date, which is Day 0. When **Interest recognition on disbursement date** is off, interest accrues from the first repayment day through the last repayment date, so no interest accrues on Day 0. When it is on, interest accrues on Day 0 at end of day.

### When interest recognition on disbursement date is off

With the setting off, interest accrues on the outstanding loan balance as the day started, so intra-day actions such as repayments do not change that day's interest. Interest starts on Day 1, the day after disbursement, and accrual is recognised at end of day as part of the close of business workflow, or when the loan is fully paid. Payable interest is one day ahead of the daily periodic accrual calculation.

Repayment period rules:

- The repayment period from date is exclusive for most actions and is Day 0 from an interest point of view.
- The due date is inclusive for most actions and is the last day of the period from an interest point of view.
- The repayment period due date and the following repayment period from date are the same, with no date gaps.
- On the due date, actions belong to the period that the due date falls on.
- Interest is never calculated for Day 0 of the period, and the last day of interest is the due date.

If the customer fully repays the loan on the disbursement date, they can do so without any obligation to pay interest.

With the setting off, the start of interest recognition is controlled by the interest charged from date if provided during loan creation, otherwise by the interest-charged-from-date-same-as-disbursal-date global configuration parameter, otherwise it starts with disbursement date plus one day.

### When interest recognition on disbursement date is on

With the setting on, the disbursement date is Day 0 from an interest perspective and Day 1 of the repayment period. Interest accrues based on the outstanding loan balance at the end of each day, using the actual total outstanding principal. Any intra-day action, such as a repayment, affects that day's interest calculation. Payable interest stays in sync with the daily periodic accrual calculation.

Interest timing rules:

- The obligation to pay interest starts on the day after disbursement.
- The repayment period from date is Day 0 from an interest perspective and is inclusive.
- The due date is inclusive for most actions but does not belong to the actual interest period.
- Repayment period due date and the following repayment period from date are the same date, with no gap between periods.
- On the due date, actions belong to the period that the due date falls in, except for interest.
- The 0th day of the repayment period is not excluded from an interest perspective.

### Interest Charged From Date

The interest charged from date decides when interest starts accruing on a loan. It is set by two flags on the loan product: interest charged from disbursement date and interest charged from date same as disbursal date.

| Interest charged from disbursement date | Interest charged from date same as disbursal date | Interest charged from date |
| --- | --- | --- |
| FALSE | FALSE | Disbursement date + 1 day |
| TRUE | FALSE | Disbursement date |
| FALSE | TRUE | Disbursement date |
| TRUE | TRUE | Disbursement date |

The number of days in month and year used for interest calculation follow the configuration for interest calculation from Day 0 (disbursement date).

### Progressive Loan Accrual

Progressive loan accrual allocates interest to repayment installments from oldest to newest, up to the charged interest on each period. Accrual transactions are not tied to repayment periods by transaction date, and their relationship to installments may be removed.

Each day at end of business (COB), the system compares the calculated interest accrual amount with the total already accrued interest:

- If the calculated amount is higher, it creates an Accrual transaction for the difference and allocates the accrued amount on installments from oldest to newest.
- If the calculated amount is equal, no accrual is needed.
- If the calculated amount is lower, it creates an Accrual Adjustment transaction for the difference and lifts the accrued amount from installments from newest to oldest.

Daily interest for the current date and total interest till date are calculated using an up-to-date ProgressiveLoanInterestScheduleModel and ProgressiveEmiCalculator as part of the Add Periodic Accrual Transactions business step. The combined total of Accrual transaction balances and Accrual Adjustment amounts cannot exceed the charged interest on the repayment schedule.

To catch up on missed days, move the current date to the due date of the period and run COB for each day; inline COB catch-up is a convenient way to do this.

- Move current date to the due date of the period and run COB for each day.

### Interest period boundaries

With the setting off, interest is charged from Day 1 through the maturity date: it becomes payable on Day X and accrues at end of day X. With the setting on, interest is charged from Day 0 through the day before the maturity date: it accrues at end of day X and becomes payable at the start of day X+1. Both calculate exactly the same amount of interest.

### Interest Recognition on Disbursement Date

Interest recognition on disbursement date decides whether interest is recognised at end of day on the disbursement date or the following day. It applies only to loans using the progressive loan schedule type. The setting is stored on the loan product level and can be overridden when a loan is created, and it can be updated while the loan is created but not yet approved or disbursed.

The behaviour depends on whether interest recognition on disbursement date is enabled.

| Setting | Interest recognition | Interest charging starts | Daily interest calculation |
| --- | --- | --- | --- |
| TRUE | Day 0 (disbursement date) end of day | Day 0 (disbursement date) end of day | Based on current date + 1 |
| Not provided or FALSE | Day 1 (disbursement date + 1) end of day | Day 1 (disbursement date + 1) end of day | Based on current date |

> **Note:** When enabled, end of day creates an accrual transaction with daily interest on the disbursement date end of day, calculated using the EMICalculator.

### Interest Rate and Promotional Offers

A promotional offer charges 0% interest for a set number of days at the start of a loan. Interest accrual is suspended immediately upon disbursement while the promotional rate applies. Standard interest calculation begins automatically when accrual is active at the normal rate. The standard rate is 7%, with 360 days in a year and 30 days in a month.

### Worked examples

Figures in this example are illustrative. A loan of 3,600 is disbursed on 1 January. The annual interest rate is 10%, the year has 360 days, and each month has 30 days, so interest builds at 1.00 per day on the full outstanding balance. The example compares the setting off, where interest starts on the day after disbursement, with the setting on, where interest starts on the disbursement date itself.

| Day | Date | Off: payable at start of day | Off: accrued at end of day | On: payable at start of day | On: accrued at end of day |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 Jan | 0.00 | 0.00 | 0.00 | 1.00 |
| 1 | 2 Jan | 1.00 | 1.00 | 1.00 | 2.00 |
| 2 | 3 Jan | 2.00 | 2.00 | 2.00 | 3.00 |

Turning the setting on moves the first day of interest from the day after disbursement to the disbursement date itself; the total interest over the full term stays the same because the due date is no longer counted.

## Early and Late Repayment Interest

### Early and late repayment interest

Early repayment lowers the total cost of the loan, while late payments add interest. For loans with interest recalculation enabled, interest is recalculated and collected as of the transaction date when an early payment is made. For late repayments, interest is calculated and collected only until the installment date.

### Early repayment interest calculation

The recalculated interest becomes the interest portion of that installment period. If you pay an EMI or a greater amount, the system closes the installment period with interest recalculated.

### Early repayment allocation

Advance amounts from early repayments are allocated to the next installment or the last installment based on the configuration set.

Advance amounts from late repayments are adjusted to the next installment, the last installment, or first to the next installment and the remainder to the last installment, based on the configuration set.

- A repayment can pay late some periods and also pay some periods in advance.

### Early repayment interest collection

The system collects calculated interest only for early payments made against the current installment when the loan uses an adjust to next installment configuration. No interest is payable on a future installment because it has no past days.

Payable interest for the current installment equals:

- the total interest for the past days of the current installment
- plus the daily interest of the current date

### Early repayment with adjust to last installment

With adjust to last installment, an early payment covers only principal and no interest is collected, unless the only unpaid installment is the current one. In that case, you must calculate and pay the payable interest.

### Effect on final installment

Early repayment reduces interest accrued over the remaining life of the loan, so the final installment is lower than the other installments. Late repayment adds interest on the higher balance, so the final installment is higher than the other installments.

### Schedule recalculation after early repayment

After an early repayment, the system recalculates the remaining installments based on the new outstanding principal balance and adjusts the interest accordingly.

Installment interest is calculated as:

- Installment interest equals principal balance times (rate factor minus 1).

### Late repayment interest calculation

### Progressive interest bearing loans

For a progressive interest bearing loan product with interest recalculation enabled, the system supports early and late payment situations. The advance payments adjustment type Adjust last, unpaid period is available and is the only supported rule for progressive loans.

### Adjust last unpaid period

When you make an in advance payment, the system amends the EMI of the last unpaid period. If the last installment was fully paid, it amends the last but one period instead.

### Interest recalculation limits

Interest recalculation happens only up to the maturity date. Recalculation replays all transaction types, including accruals, in reverse order.

### Late repayments after maturity date

When a late repayment arrives after the maturity date, the system collects the installment interest it fulfills and creates a new installment as of the repayment date. Interest on that installment is calculated for the extra days from the last maturity date on the first overdue principal balance. No installment is created for late repayments that do not fall after the maturity date.

### EMI and payable interest rules

It limits EMI changes, restricts payments to payable interest, and closes a period when repayment covers the full amount due.

Rules for loans with interest recalculation enabled:

- You cannot change the EMI unless it is the last unpaid period and must be amended due to early repayments.
- You can pay only payable interest, which is outstanding accumulated interest up to the current date.
- If your repayment covers the full amount due for the period (EMI minus payable interest), the principal due amount changes and the period closes.

### Interest moved to next period

For loans with interest recalculation enabled, if so much principal was paid that remaining interest cannot be recognised on the period, interest is moved to the next period.

When interest is moved to the next period, the from date used to calculate the interest of the upcoming period is the current date plus one day and belongs to this period. This applies whether interest is moved because remaining interest cannot be recognised or because the period is closed due to early repayment.

### Multiple advance payments or payoff

When interest recalculation is enabled and an advance payment closes one or more periods without any payable interest, the same rules apply as for other early repayments. If excessive payments or payoffs happen more than once, interest moves to the next installment and is recalculated from the newer outstanding balance until the final installment; once all principal is paid, interest becomes zero.

### Payment allocation order

When you make a payment, the system allocates it to installments in this order: past installments (due date before the payment date), due installments (due date on the payment date), installments paid in advance (due date after the payment date), current installments (payment date falls between the day after the installment start date and the installment due date), past due installments oldest first, then installments paid in advance based on configuration (next or last).

### Configuration settings

Two configuration settings control how interest timing handles repayments: recalculate interest and future installment allocation.

| Setting | Value |
| --- | --- |
| Recalculate interest configuration | Enabled |
| Repayment transaction future installment allocation rule | Last installment |
| Future installment allocation rule | Next installment |
