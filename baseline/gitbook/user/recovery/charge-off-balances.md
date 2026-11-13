# Charge-Off Balances

## Charge-off behavior

On the day of charge off, the full loan balance becomes due and collectible. Interest is calculated only to the day of charge off and stops from the next day.

Charge-off behavior depends on timing:

- After the maturity date, the full balance does not become due immediately.
- Before the maturity date, all future installments are removed and the actual installment is amended with the due date of the charge-off transaction date, containing the total principal and charges amount of the removed future installments.
- The N+1 balance still goes to the recalculated installment when charge-off happens before the maturity date.
- N+1 installments are not affected by charge-off activity.

Interest and repayments:

- Backdated repayments and reversals trigger the reverse-replay of all transactions and the charge-off transaction.

## Eligible loan products

If the loan product is not progressive, does not have interest, or does not have interest recalculation enabled, only REGULAR charge-off behavior is supported.

## Charge-off timing and criteria

You can charge off a loan account only on or before the latest transaction date on that account. Backdated transactions are supported. Charge-off cannot be done on a future date.

If Credit Loss/Bad Debt Fraud is configured for charge-off and the charge-off reason is FRAUD, the configured GL account is used for the journal entries of the charge-off transactions.

## Charge-off behavior options

Charge-off behavior controls what happens to a loan when it is charged off. Choose one of three options on the Settings >> Loan schedule page: Regular, Zero interest after charge-off, or Accelerate maturity to charge-off date. When Accelerate maturity to charge-off date is set and the loan is charged off, the system creates a new final installment due on the charge-off date that contains all future balance, removes installments after the charge-off date, adds interest pending until the charge-off date to the new final installment, and does not calculate interest on that final installment.

## Undoing a charge-off

Undoing a charge-off reestablishes the loan schedule that existed before the charge-off.

## Future charges

Future charges are handled as part of the charge-off amount and remain unpaid to be collected with coming payments.

The following rules apply to future charges:

- Future fees are waived rather than dropped or moved to the newly created final installment.
- Charges that are already paid or waived are not affected by the charge-off.
- If any unpaid charge associated with the charge-off is waived, the charge-off transaction is reverse-replayed.
- Charge handling behavior remains the same for all charge-off behaviours (regular, zero future interest, accelerate) and for both interest recalculation enabled and disabled.
- For a progressive, interest bearing loan with interest recalculation enabled and charge-off behaviour accelerate maturity date, if a charge with a due date after the charge-off date exists, the charge due date becomes the N+1 installment.

## Interest calculation and accrual

When a loan is charged off, interest accrual stops and the system posts any missing accrual on the charge-off date. Interest accrual uses a day count of 30 days per period and a 360-day year.

Interest calculation differs by loan type:

- For a progressive loan with interest recalculation not enabled, interest is calculated till the charge-off date using (total interest of the period) / (number of days of the period) * (number of days till charge-off date), where the period from date is exclusive and the charge-off date is inclusive.
- For interest recalculation enabled loans, transactions are reprocessed to get the interest schedule, then the due interest for the current period is calculated.
- For a cumulative loan, the daily accrual amount for any not yet accrued payable interest is calculated and an accrual transaction is posted real-time on the charge-off date.

The system applies these changes at charge-off:

- Calculated interest is set on the current period; the charge-off date decides which period it belongs to, with the period from date exclusive and the period due date inclusive.
- Principal due on the period is increased with the difference between the original interest of the period and the new interest of the period after charge-off.
- The due date of the current period is changed to the charge-off date and all future periods are removed.

Accrual transactions on the charge-off date:

- For a charged-off progressive loan where interest recognition from disbursement date is TRUE and this is the first time the charge-off transaction is created, no accrual transaction needs to be generated immediately because there is no difference between accrued interest and payable interest.
- For a charged-off progressive loan where interest recognition from disbursement date is FALSE, the missing daily interest accrual must be calculated and created because no further accruals will be done after charge-off.
- A new accrual or accrual adjustment transaction must be created on the charge-off date before the charge-off transaction itself timestamp-wise if the charge-off amounts changed.

Backdated charge-offs and reversed repayments:

- For a progressive loan with a backdated charge-off transaction, all accrual entries with a transaction date after the charge-off transaction date must be reversed real-time.
- For a backdated charge-off where interest recognition from disbursement date is TRUE, accrual entries with transaction dates of 13th of Jan and 14th of Jan must be reversed.
- For a backdated charge-off where interest recognition from disbursement date is FALSE, accrual entries with transaction date of 14th of Jan must be reversed.
- For a charged-off progressive loan with interest recalculation enabled, when a backdated repayment or an earlier transaction is reverted after charge-off, accruals must be recalculated real-time and an accrual or accrual adjustment transaction must be posted if applicable.
- For a charged-off progressive loan where interest recognition from disbursement date is TRUE, the accrual or accrual adjustment transaction created after reversing a backdated repayment must have a transaction date of 31st of Jan (the charge-off transaction date).

## Product settings

Charge-off behavior is stored with the product definition. Interest recognition from disbursement date is set to FALSE.

## Worked examples

A loan officer charges off a progressive, interest-bearing loan before its maturity date. The figures are illustrative: a principal of 1,000, an annual interest rate of 12 percent, three monthly installments, and 30-day months. The first installment is paid on 1 February. The charge-off is posted on 1 March, before the final installment is due on 1 April. On charge-off, the full remaining balance becomes due, future installments are removed, and interest is calculated only to the charge-off date. The example shows that charge-off before maturity collects the outstanding balance plus interest to the charge-off date, while future interest is removed.

| Date | Event | Principal | Interest | Total due | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | – | – | – | 1,000.00 |
| 1 February | Installment 1 | 330.00 | 10.00 | 340.00 | 670.00 |
| 1 March | Charge-off (final installment) | 670.00 | 6.70 | 676.70 | 0.00 |
| 1 April | Installment 3 removed (not collected) | 336.70 | 3.37 | 340.07 | – |

When interest recalculation is not enabled, interest to the charge-off date is prorated by day. The setup is the same: principal of 1,000, annual interest of 12 percent, three monthly installments, and 30-day months. The first installment is paid on 1 February, leaving a balance of 670.00. The charge-off is posted on 15 March, halfway through the period that ends on 1 April. Interest for the full period would be 6.70, so interest for 15 of the 30 days is 3.35. The remaining principal is due in full, and the future installment on 1 April is removed. With recalculation enabled instead, the same charge-off date would use the recalculated schedule interest rather than the day-based proration.

| Date | Event | Principal | Interest | Total due | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | – | – | – | 1,000.00 |
| 1 February | Installment 1 | 330.00 | 10.00 | 340.00 | 670.00 |
| 15 March | Charge-off (final installment) | 670.00 | 3.35 | 673.35 | 0.00 |
| 1 April | Installment 3 removed (not collected) | 336.70 | 3.37 | 340.07 | – |

A charge-off reversal reinstates the loan schedule that existed before the charge-off. Using the same loan of 1,000 with three monthly installments, if the charge-off on 1 March is reversed on 3 March, the original installments on 1 March and 1 April are restored and the balance returns to 670.00 after the 1 February payment. The reversal produces exactly the same schedule as before the charge-off, so no payment history is lost.

| Date | Event | Principal | Interest | Total due | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 January | Disbursement | – | – | – | 1,000.00 |
| 1 February | Installment 1 | 330.00 | 10.00 | 340.00 | 670.00 |
| 1 March | Installment 2 (restored after reversal) | 333.30 | 6.70 | 340.00 | 336.70 |
| 1 April | Installment 3 (restored after reversal) | 336.70 | 3.37 | 340.07 | 0.00 |
