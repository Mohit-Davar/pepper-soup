# Charge-Off Balances

## Charge-off behavior and purpose

Charge-off makes the full loan balance collectible on the day of charge-off and stops interest calculation and accrual from the next day. Interest accrues until the charge-off date and becomes the charge-off interest portion. Charge-off behavior applies only to Progressive loan products where interest is not zero; other products support only REGULAR charge-off behavior. Installments after charge-off are not affected. Charge-off behavior does not apply after the maturity date. Accelerate maturity is available for interest-bearing, progressive loan products.

| Loan product type | Charge-off behavior | Interest until charge-off | Full balance due |
| --- | --- | --- | --- |
| Progressive with interest | Supported | Calculated until charge-off date | Yes, on charge-off day |
| Non-progressive or no interest | REGULAR only | Not stated | Not stated |

> **Note:** If Credit Loss/Bad Debt Fraud is configured and the charge-off reason is FRAUD, the configured GL account is used for the charge-off journal entries.

## Eligibility and timing

You can charge off a loan account only on or before the latest transaction date on that account.

## Charge-off before maturity date

Before the maturity date, the system removes all future installments and amends the actual installment with the due date of the charge-off transaction date. The amended installment contains the total principal and charges amount of the removed future installments. The N+1 balance still goes to the recalculated installment.

## Undoing a charge-off

Undoing a charge-off reverses the charge-off transaction and restores the loan schedule that existed before the charge-off. The reversed charge-off transaction appears in the transaction response.

## Schedule changes

When accelerate maturity to charge off date is set, charging off the loan does the following:

- A new final installment is created with the due date of the charge-off date.
- The new final installment contains all future balance.
- Installments after the charge-off date are removed.
- Interest pending till the charge-off date is added to the new final installment.
- Interest is not calculated for the new final installment.

## Interest calculation

Interest calculation rules depend on the loan product:

- For a progressive loan product with interest recalculation not enabled, interest is calculated till the charge-off date using (total interest of the period) / (number of days of the period) * (number of days till charge-off date). The period from date is exclusive and the charge-off date is inclusive.
- For loans with interest recalculation enabled, transactions are reprocessed using AdvancedPaymentScheduleTransactionProcessor.reprocessProgressiveLoanTransactions to get the ProgressiveLoanInterestScheduleModel, then the EMICalculator calculates the due interest for the current period.

After interest is calculated:

- Calculated interest is set on the current period. The charge-off date decides which period it belongs to, with the period from date exclusive and the period due date inclusive.
- Principal due on the period is increased with the difference between the original interest of the period and the new interest of the period after charge-off.

## Interest accrual

Interest accrual for a charged-off loan calculates any interest that has not yet been accrued and posts an accrual transaction on the charge-off date. Interest accrual uses a day count of 30 days per period and a 360-day year.

The following rules apply to charged-off loans:

- A new accrual or accrual adjustment transaction is created on the charge-off date before the charge-off transaction itself timestamp-wise if the charge-off amounts changed.
- Where interest recognition from disbursement date is TRUE and this is the first time the charge-off transaction is created, no accrual transaction is generated immediately because there is no difference between accrued interest and payable interest.
- Where interest recognition from disbursement date is FALSE, the missing daily interest accrual is calculated and created because no further accruals are done after charge-off.

Backdated activity triggers the following real-time behaviour:

- For a progressive loan with interest recalculation enabled, when a backdated repayment or an earlier transaction is reverted after charge-off, accruals are recalculated real-time and an accrual or accrual adjustment transaction is posted if applicable.
- For a progressive loan with a backdated charge-off transaction, all accrual entries with a transaction date after the charge-off transaction date are reversed real-time.

For a backdated charge-off, accrual entries are reversed as follows:

- Where interest recognition from disbursement date is TRUE, accrual entries with transaction dates of 13th of Jan and 14th of Jan are reversed.
- Where interest recognition from disbursement date is FALSE, accrual entries with transaction date of 14th of Jan are reversed.

## Charges

Charge-off behaviour applies the same way to all charge-off behaviours (regular, zero future interest, accelerate) and whether interest recalculation is enabled or disabled. Future fees are waived rather than dropped or moved to the newly created final installment.

Charges are handled as follows:

- Charges that are already paid or waived are not affected by the charge-off.
- Unpaid charges added after, before, or on the charge-off date are considered part of the charge-off amount and remain unpaid to be collected as part of coming payments.
- If any unpaid charge associated with the charge-off is waived, the charge-off transaction is reverse-replayed.
- For a progressive, interest bearing loan with interest recalculation enabled and charge-off behaviour accelerate maturity date, if a charge with a due date after the charge-off date exists, the charge due date becomes the N+1 installment.

## Repayments and monetary activity

Backdated repayments and other monetary activity are reprocessed automatically. Repayments and other monetary activity after the charge-off are not reprocessed; existing repayment periods are used and the AdvancedPaymentScheduleTransactionProcessor handles the loan as if it does not do interest recalculation.

## Accounting entries

Charge-off accounting moves balances between liability and expense accounts based on whether the charge-off is fraud or non-fraud, and on whether the amount is interest, fees, or penalties.

| Type | Portion | Debit account | Credit account |
| --- | --- | --- | --- |
| Non-fraud | Discount fees amortization | 240005 Deferred Interest Deferred Income Liability Int | 744007/744037 Credit loss-bad dept Charge off expense Expense Int |
| Fraud | Discount fees amortization | 240005 Deferred Interest Deferred Income Liability Int | 744007/744037 credit loss-bad dept- fraud charge-off fraud expense Expense Int |
| Fraud | Interest | Interest income charge off | Interest Receivable |
| Fraud | Fees | Fee Charge off | Fee Receivable, charge-off fees Income |
| Fraud | Penalty | Fee Charge off | Fee Receivable, charge-off Penalty Income |
| Non-fraud | Fees | Fee Charge off | Fee Receivable, charge-off fees Income |
| Non-fraud | Penalty | Fee Charge off | Fee Receivable, charge-off Penalty Income |

| Portion | Debit account | Credit account |
| --- | --- | --- |
| Fees | Fee Income, Fee Charge off | income from fees, charge-off fees Income |
| Unallocated Credit (UNC) | Fee Income, Other Credit liability | income from fees, Overpayment Liability |
| Penalty | Fee Income, Fee Charge off | income from penalties, charge-off Penalty Income |

> **Note:** All unreleased deferred income balance moves to expenses.

## Product configuration

Charge-off behavior is stored with the product definition. Interest recognition from disbursement date is set to FALSE.

## Worked examples

A progressive, interest-bearing loan is charged off before maturity. The figures are illustrative: principal 1,000.00, annual interest 12% (1% per 30-day month), three monthly installments due on 1 February, 1 March and 1 April, disbursed on 1 January, with no repayments before the charge-off on 15 January. Because the loan is progressive and bears interest, interest runs until the charge-off date, the full balance becomes due that day, and every future installment is removed and replaced by a single final installment due on 15 January. If interest recalculation is not enabled, interest is prorated as (period interest ÷ period days) × days till charge-off; with these round figures the charge-off interest is still 5.00.

| Step | Amount |
| --- | --- |
| Outstanding principal on 15 January | 1,000.00 |
| Interest for 15 days (1,000.00 × 1% ÷ 30 × 15) | 5.00 |
| Full balance due on charge-off | 1,005.00 |
| Final installment principal | 1,000.00 |
| Final installment interest | 5.00 |
| Final installment total | 1,005.00 |
| Balance after charge-off | 0.00 |

Reversing a charge-off reestablishes the previous loan schedule exactly. Using the same loan from the previous example, the charge-off on 15 January replaces the three installments with one final installment of 1,005.00 and brings the balance to 0.00. When the charge-off is reversed, the original schedule returns: installments due on 1 February, 1 March and 1 April with principal 333.33, 333.33 and 333.34, interest 10.00, 6.67 and 3.33, and closing balances 666.67, 333.34 and 0.00. The reversal produces the same schedule as before the charge-off.

| Event | Due date | Principal | Interest | EMI | Balance |
| --- | --- | --- | --- | --- | --- |
| Original schedule | 1 February | 333.33 | 10.00 | 343.33 | 666.67 |
| Original schedule | 1 March | 333.33 | 6.67 | 340.00 | 333.34 |
| Original schedule | 1 April | 333.34 | 3.33 | 336.67 | 0.00 |
| After charge-off | 15 January | 1,000.00 | 5.00 | 1,005.00 | 0.00 |
| After reversal | 1 February | 333.33 | 10.00 | 343.33 | 666.67 |
| After reversal | 1 March | 333.33 | 6.67 | 340.00 | 333.34 |
| After reversal | 1 April | 333.34 | 3.33 | 336.67 | 0.00 |

On a charged-off progressive loan, accrual stops from the day after the charge-off, so any payable interest not yet accrued must be posted on the charge-off date, before the charge-off transaction itself if the charge-off amounts changed. With interest recognition from disbursement date set to FALSE, no daily accrual has been posted from disbursement, so the missing interest for 15 days is accrued on 15 January. With interest recognition from disbursement date set to TRUE, accrued interest already equals payable interest, so no accrual transaction is generated immediately.

| Item | Amount |
| --- | --- |
| Principal | 1,000.00 |
| Annual interest rate | 12% |
| Interest for 15 days (1,000.00 × 12% ÷ 360 × 15) | 5.00 |
| Charge-off transaction on 15 January | -1,005.00 |
| Balance after charge-off | 0.00 |

Charge-off accounting moves the unreleased deferred income balance to expenses and splits the collected amount by component. For non-fraud charge-offs, the discount-fee amortization credits 744007/744037 Credit loss-bad dept Charge off expense; for fraud charge-offs it credits 744007/744037 credit loss-bad dept- fraud charge-off fraud expense. The debit is always 240005 Deferred Interest Deferred Income Liability. Interest, fees and penalties each map to their own charge-off income and receivable accounts, with fraud using Interest income charge off and Interest Receivable for the interest portion.

| Component | Debit | Credit (non-fraud) | Credit (fraud) |
| --- | --- | --- | --- |
| Discount-fee amortization | 240005 Deferred Interest Deferred Income Liability | 744007/744037 Credit loss-bad dept Charge off expense | 744007/744037 credit loss-bad dept- fraud charge-off fraud expense |
| Interest portion | — | — | Interest income charge off; Interest Receivable |
| Fees portion | — | Fee Charge off; Fee Receivable; charge-off fees Income | Fee Charge off; Fee Receivable; charge-off fees Income |
| Penalty portion | — | Fee Charge off; Fee Receivable; charge-off Penalty Income | Fee Charge off; Fee Receivable; charge-off Penalty Income |
