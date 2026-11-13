# Progressive Loan Accruals

## Purpose and benefits

Progressive loan accruals record interest as posted interest transactions so interest activity affecting the loan balance appears in monetary activity. The system generates interest accruals for charge-off loan accounts as usual and avoids reverse-replay around interest accruals.

## Accrual posting job and schedule

The periodic accrual posting job posts accrued interest, fees, and penalties on loan accounts according to the set accrual posting period. The accrual is created daily but does not become due and payable until the next billing cycle due date.

| Accrual posting period | Posting frequency |
| --- | --- |
| Monthly | Every month |
| Daily | Every day |

For each business day, the Add Periodic Accrual Transactions job creates an “Accrual” or “Accrual - adjustment” transaction with no gaps. When run as part of close of business (COB), the “Add periodic accrual” business step executes during “Closing the actual business day”.

## Accrual calculation

The accrual job calculates interest based on the balances and rates defined when the loan was created. Interest accrues daily from the last accrued date or disbursement date to the current accrual date. The job checks whether the total accrued amounts match the calculated accrued amounts up to the current date, and creates an accrual or accrual adjustment when they do not. Certain loan statuses and balances can be excluded from accrual based on setups defined for the job. Interest calculation period is set to Daily by default.

## Accrual entry creation

JPA creates accrual entries and related inserts such as paid by; no native query is used. Accrual handling creation and recalculation runs in a common component that handles all accrual actions and calculations, separate from the Loan entity and other services. If an amount remains unaccrued from the last accrued date, the system posts the accrual entry along with the repayment that closes the loan account.

## Backdated activity and recalculation

Backdated repayments or reversals of backdated repayments before the last accrual transaction trigger recalculation of the accrual amount, and the differences are adjusted to the latest accrual transaction only. Recognized income might change when backdated activity causes interest recalculation, when a backdated disbursement occurs, or when a previous repayment is reversed and interest is recalculated. When a backdated repayment happens, nothing is done immediately; the Add periodic accruals business step calculates the proper accrual transaction. Backdated monetary activity may require reverse-replay or creation of additional accrual entries for transitions between Closed obligations met and Overpaid.

## Accrual adjustments

When an accrual adjustment changes the amount of interest to recognize, the Add periodic accrual job posts a transaction for the current date. If the adjusted amount is higher than the amount already posted, the job creates an Accrual transaction with the higher amount. If the adjusted amount is lower than the amount already posted but not lower than the latest accrual amount, the job creates an Accrual transaction with the lower amount.

If the adjusted amount is lower than both the amount already posted and the latest accrual amount, the negative difference is posted as an “accrual adjustment” transaction.

The “Accrual - Adjustment” transaction type is created by the Add periodic accruals business step when extra income was recognized and needs explicit correction of the total amount:

- There is no accrual reverse-replay; either the next accrual is created with a higher or lower amount, or a new Accrual - Adjustment transaction deducts the accrual amount effectively.

## Reverse-replay limitations

Transaction reverse-replay is not supported. Early or late repayment with interest recalculation is not supported. The LOAN_INTEREST_RECALCULATION step does not reverse and replay the accrual created by ADD_PERIODIC_ACCRUAL_ENTRIES.

For an interest bearing progressive loan with interest recalculation and down payment enabled, payments on the down payment period:

- Do not call payInterest on the EMICalculator.
- Do not call payPrincipal on the EMICalculator.

## Income recognition timing

Income recognition happens at end of day, during the close of business job or “Add periodic Accrual transactions” job execution.

## Schedule history and recalculation date

When interest recalculation changes the repayment schedule, the system recognizes interest for the actual day using the old interest due from the loan repayment schedule history. The loan field interest_recalculated_on shows whether recalculation happened on the current date, which decides whether to use the history entry or the actual schedule entry. A business date column identifies the balance before interest recalculation happened. The progressive loan schedule generator always produces at least one InterestPeriod per RepaymentPeriod, and RepaymentPeriod.interestPeriods must never be empty for a loan in ACTIVE status.

## Overpaid accounts and charges

On an overpaid account, no accrual is created when a charge is created, and repayment is not reversed. During close of business (COB), the nightly job that posts interest and fees, accrual is created and repayment is reversed and replayed. If the charge-accrual-date global configuration is set to submitted-date and the loan is backdated with the current date later than the installment due date, the accrual transaction is still created on the charge submitted date. No unusual accrual adjustment or accrual transaction is created when repayment was done in advance.

## Final accrual reversal rules

The system reverses only the final accrual transaction when future payable interest or charges exist on the loan. If no future payable interest or charges exist, the accrual transaction was correct and is not reversed.

Backdated transactions, charges, or transaction reversals can change which installment an accrual transaction relates to:

- The relationship between LoanTransaction and LoanRepaymentScheduleInstallment is updated to point to the right installment.
- New relations are created if applicable.

## Cumulative schedule calculation

Cumulative schedule calculation calculates the repayment schedule based on every disbursement made on the loan. When a second disbursement arrives after the first repayment, the system accumulates the disbursements and distributes the total equally across the schedule.

## Double precision enhancement

Daily accrual calculation uses decimal arithmetic instead of doubles.

## Worked examples

A loan is disbursed for a principal of 1,000.00 at an annual interest rate of 12%, with 30-day months. The periodic accrual posting job creates an Accrual transaction every business day when the accrual posting period is daily. Interest is calculated on the current balance from the last accrued date to the current date and is added to an accrued bucket; it is not due and payable until the next billing cycle. The figures in this example are illustrative.

| Business date | Balance | Days | Daily interest | Accrual posted | Accrued bucket | Due and payable |
| --- | --- | --- | --- | --- | --- | --- |
| 2 Jan | 1,000.00 | 1 | 0.33 | 0.33 | 0.33 | 0.00 |
| 3 Jan | 1,000.00 | 1 | 0.33 | 0.33 | 0.66 | 0.00 |
| 4 Jan | 1,000.00 | 1 | 0.33 | 0.33 | 0.99 | 0.00 |
| 5 Jan | 1,000.00 | 1 | 0.33 | 0.33 | 1.32 | 0.00 |
| 6 Jan | 1,000.00 | 1 | 0.33 | 0.33 | 1.65 | 0.00 |

If the accrual posting period is monthly instead of daily, the job posts a single Accrual transaction of 10.00 on the last day of the month rather than daily entries; the total interest accrued for the month is unchanged.

A loan of 1,000.00 at 12% annual interest accrues 0.33 per day. Accrual transactions of 0.33 have been posted on 2, 3, and 4 January, so the latest accrual amount is 0.33 and the total already posted is 0.99. On 5 January a backdated repayment of 900.00 principal is applied with an effective date of 2 January. The recalculation covers the period from the last accrued date to the current date using the reduced balance, and the difference is adjusted to the latest accrual transaction only; earlier accrual transactions are not reversed or replayed.

| Date | Event | Balance | Interest accrued | Cumulative accrued | Transaction type |
| --- | --- | --- | --- | --- | --- |
| 2 Jan | Daily accrual | 1,000.00 | 0.33 | 0.33 | Accrual |
| 3 Jan | Daily accrual | 1,000.00 | 0.33 | 0.66 | Accrual |
| 4 Jan | Daily accrual | 1,000.00 | 0.33 | 0.99 | Accrual |
| 5 Jan | Backdated repayment of 900.00 effective 2 Jan | 100.00 | 0.03 | 0.09 | - |
| 5 Jan | Accrual adjustment | 100.00 | -0.90 | 0.09 | Accrual - adjustment |

The example shows that a backdated repayment before the last accrual triggers recalculation, and when the recalculated amount is below both the total already posted and the latest accrual, the difference is posted as a negative “Accrual - Adjustment” transaction instead of reversing earlier accruals.

A loan of 1,000.00 at 12% annual interest is moved to charge-off status. The accrual job continues to generate interest accruals for charge-off accounts and creates an Accrual or “Accrual - adjustment” transaction for every business day with no gaps. Because the product avoids reverse-replay, a later repayment does not cause earlier accrual entries to be reversed and replayed; any correction is made in the current or latest accrual transaction only.

| Business date | Loan status | Balance | Daily interest | Accrual posted | Transaction type |
| --- | --- | --- | --- | --- | --- |
| 2 Jan | Active | 1,000.00 | 0.33 | 0.33 | Accrual |
| 3 Jan | Charge-off | 1,000.00 | 0.33 | 0.33 | Accrual |
| 4 Jan | Charge-off | 1,000.00 | 0.33 | 0.33 | Accrual |
| 5 Jan | Charge-off | 1,000.00 | 0.33 | 0.33 | Accrual |

The example shows that charge-off status does not stop accrual and that the job posts an accrual transaction for every business day without reverse-replaying earlier entries.
