# Backdated Loans

## Backdated loan transactions

You can create backdated loan transactions with a business date earlier than the current date. No transaction can be executed on a future date.

Backdated monetary activities supported include:

- Disbursement reversals.
- Refund reversals.
- Repayment reversals.
- Fee-penalty-charge adjustment reversals.
- Goodwill credit.
- Interest accrual activity.
- Interest refund-reversal.
- Interest payment waiver.

Backdated transactions are allowed as long as they are the latest transaction in the loan life cycle:

- Disbursement.
- Refund merchant issued.
- Refund PayPal payout.
- Refund reversal PayPal payout reversal.
- Repayment.
- Repayment reversal.
- Fee addition.
- Charge adjustment.
- Charge adjustment reversal.
- Credit balance refund.
- Goodwill credit reversal.
- Chargeoff.
- Interest waiver interest payment waiver.
- Interest refund.

## Loan status after backdated repayment or reversal

A backdated repayment or reversal changes the loan balance, and the loan status follows the new balance.

The status changes as follows:

- If the backdated repayment brings the balance to zero, the loan moves to closed status.
- If the backdated repayment brings the balance below zero, the loan moves to overpaid status.
- If you reverse a repayment on a closed loan, the loan becomes active again.
- You cannot make a backdated repayment or reversal on a written-off loan account.

## Delinquency and breach recalculation

The system recalculates delinquency and breach evaluation when a backdated repayment, reversal, GWC, or GWC reversal happens.

## Transaction reversal and replay

When you reverse a repayment transaction, the system reverses and replays the related activity so the loan balance and schedule reflect the reversal. Accrual activity is reverse and replayed once. For loans with interest recalculation enabled, this happens consistently across all scenarios and only one reverse-replay occurs for the same transaction. The reverted transaction's external id is copied to the replayed transaction, and the reverted transaction's external id becomes null.

Charge allocation after reversal depends on how charges were paid:

- If all charges were fully paid before the backdated transaction, the backdated transaction pays no charges and no transaction allocation changes.
- If the reverted transaction paid portions of any charges, existing transactions after the reverted transaction might need reevaluation and allocation changes.

> **Note:** Goodwill credit is not reversed and replayed after repayment reversal, and its external id is null.

## Schedule updates

When a loan schedule is backdated, the amortization schedule, delinquency schedule and breach schedule are updated. Recalculation starts from the original transaction date. The schedule shows a total outstanding amount for each installment, covering principal, fees and interest. If a repayment due date is rescheduled, the EMI stays the same; only the due date moves and interest is recalculated. For loans with Days in year: 360 and Days in month: 30, the interest calculation issue does not occur.

## Backdated processing

Backdated processing recalculates a loan after a transaction is entered with a date in the past. The system starts reprocessing immediately and accounts for the backdated loan as of the present day.

The reprocessor handles backdated transactions as follows:

- If reprocessing affects charges or credit balance refunds, the system queries transactions on or after the backdated date, reverses the repayments in reverse order as undo transactions, and then applies them again.
- If reprocessing does not affect charges or credit balance refunds, the system unwinds the transaction effects on the balance and its allocations, then fast forwards back to the present day with the backdated loan accounted for.

## Interest calculation

Interest for the next period is calculated from 16 January to 1 March based on the new outstanding loan balance. The weekly rate factor is 1 + (rate of interest * (7 * repaid every / days in year) * actual days in period / calculated days in period). For a rescheduled period, the rate factor counts full months between the from date and due date and adds the ratio of actual days in the partial period to actual days in the month of the partial period from date.

## Worked examples

A backdated loan is created with a business date later than the loan creation date. The figures here are illustrative: a principal of 1,000, an annual interest rate of 12 percent, three monthly installments, and 30-day months. The schedule shows each installment's principal, interest, balance, and the total outstanding amount that includes principal, fees, and interest. This shows how the schedule presents the total outstanding amount for each installment.

| Period | Due date | Principal | Interest | Total due | Balance | Total outstanding |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 month after disbursement | 329.93 | 10.00 | 339.93 | 670.07 | 680.14 |
| 2 | 2 months after disbursement | 333.23 | 6.70 | 339.93 | 336.84 | 340.21 |
| 3 | 3 months after disbursement | 336.84 | 3.37 | 340.21 | 0.00 | 0.00 |
| Total |  | 1,000.00 | 20.07 | 1,020.07 |  |  |

On a backdated loan, a due date can be rescheduled without changing the installment amount. Using the same loan of 1,000 at 12 percent annual interest with three monthly installments and 30-day months, the first due date is moved from one month to two months after disbursement. The EMI stays the same for the first two periods, interest is recalculated for the longer period, and only the final installment is adjusted. The total interest rises because the principal remains outstanding longer. This shows that moving a due date keeps the installment amount unchanged while recalculating interest.

| Period | Due date | Principal | Interest | Total due | Balance | Total outstanding |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 months after disbursement | 319.93 | 20.00 | 339.93 | 680.07 | 690.34 |
| 2 | 3 months after disbursement | 333.13 | 6.80 | 339.93 | 346.94 | 350.41 |
| 3 | 4 months after disbursement | 346.94 | 3.47 | 350.41 | 0.00 | 0.00 |
| Total |  | 1,000.00 | 30.27 | 1,030.27 |  |  |

A backdated repayment or reversal on a closed loan changes the loan status according to the new balance. The figures here are illustrative: a principal of 1,000 with no interest, repaid in three monthly installments of 333.33, 333.33, and 333.34. Once the balance reaches zero, the loan is closed. A backdated repayment of 100.00 on the closed loan makes the balance negative and moves the loan to overpaid status. If instead a backdated reversal of a repayment is posted on the closed loan, the balance rises and the loan becomes active again. This shows that the status follows the new balance after a backdated repayment or reversal.

| Date | Transaction | Amount | Principal | Interest | Balance | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Disbursement | Disbursement | 1,000.00 | 1,000.00 | 0.00 | 1,000.00 | Active |
| Repayment 1 | Repayment | 333.33 | 333.33 | 0.00 | 666.67 | Active |
| Repayment 2 | Repayment | 333.33 | 333.33 | 0.00 | 333.34 | Active |
| Repayment 3 | Repayment | 333.34 | 333.34 | 0.00 | 0.00 | Closed |
| Backdated repayment | Repayment | 100.00 | 100.00 | 0.00 | -100.00 | Overpaid |

See also: [Interest Timing: Early and Late Repayment Interest](confluence-link:Interest%20Timing#early-and-late-repayment-interest).
