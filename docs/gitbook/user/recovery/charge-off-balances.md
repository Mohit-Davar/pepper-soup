# Charge-Off Balances

## Charge-Off Balances

### Charge-off behavior options

Charge-off behavior options are Regular, Zero interest after charge-off, and Accelerate maturity to charge-off date. The setting is stored with the product definition and appears as a selector on the Setting >> Loan schedule page.

### Product eligibility and validation

Charge-off behaviour applies only to Progressive loan products where interest is not zero; interest recalculation is not relevant and repayment interest is irrelevant, with all methods working the same way and interest calculated till the charge-off date. Whether charge-off behaviour is supported for the loan product is validated. If a loan product is not progressive, only REGULAR charge-off behaviour is supported. If a loan product does not have interest or interest recalculation is not enabled, only REGULAR charge-off behaviour is supported. The Accelerate maturity option is available for interest bearing, progressive loan products.

When the charge-off reason is FRAUD and Credit Loss/Bad Debt Fraud is configured, the following applies:

- The configured GL account is used for charge-off journal entries.

### Charge-off timing and date rules

You can charge off a loan account only on or before today's date, and the charge-off date must be the latest transaction date on the account. Charge-off cannot occur before the last transaction date, so backdated transactions must be supported.

### Loan balance and installment changes

On charge-off before the maturity date, the full loan balance becomes due on the day of charge-off and interest is calculated only to that date. After the maturity date, the full balance does not become due on charge-off.

Before the maturity date, the system removes all future installments and amends the actual installment with the charge-off transaction date so it contains the total principal and charges from the removed future installments.

- If accelerate maturity to charge-off date is set, the system creates a new final installment due on the charge-off date containing all future balance, removes installments after the charge-off date, adds interest pending until the charge-off date to the new final installment, and calculates no interest for that final installment.
- If charge-off occurs before the maturity date under edge case N+1, the N+1 balance still goes to the recalculated installment.

### Interest calculation at charge-off

Interest is calculated up to and including the charge-off date, and interest calculation and accrual stop from the day after charge-off.

The calculation depends on the loan product settings:

- For a progressive loan product with interest recalculation not enabled, interest is calculated as (total interest of the period) / (number of days of the period) * (number of days till charge-off date), with the period from date exclusive and the charge-off date inclusive.
- For loans with interest recalculation enabled, transactions are reprocessed to obtain the progressive loan interest schedule model, then the due interest for the current period is calculated.

Charge-off also changes the schedule as follows:

- The charge-off date decides which period the charge-off belongs to; the period from date is exclusive and the period due date is inclusive.
- The due date of the current period is changed to the charge-off date and all future periods are removed.
- Principal due on the period is increased with the difference between the original interest of the period and the new interest of the period after charge-off.

### Future fees and charges

Future fees are waived rather than dropped or moved to the newly created final installment. Charges already paid or waived are not affected by charge-off.

Unpaid charges added after, before, or on the charge-off date remain part of the charge-off amount and stay unpaid to be collected as part of coming payments.

- Unpaid charges added after, before, or on the charge-off date remain part of the charge-off amount and stay unpaid to be collected as part of coming payments.

Charge handling behavior remains the same for all charge-off behaviors and for both interest recalculation settings.

- Charge handling behavior remains the same for all charge-off behaviors (regular, zero future interest, accelerate) and for both interest recalculation enabled and disabled.

If any unpaid charge associated with the charge-off is waived, the charge-off transaction is reverse-replayed.

- If any unpaid charge associated with the charge-off is waived, the charge-off transaction is reverse-replayed.

For a progressive, interest-bearing loan with interest recalculation enabled and charge-off behaviour accelerate maturity date, if a charge with a due date after the charge-off date exists, the charge's due date becomes the N+1 installment due date.

- For a progressive, interest-bearing loan with interest recalculation enabled and charge-off behaviour accelerate maturity date, if a charge with a due date after the charge-off date exists, the charge's due date becomes the N+1 installment due date.

Charge-off reversal reestablishes the previous loan schedule.

- Charge-off reversal reestablishes the previous loan schedule.

### N+1 installment handling

The system handles N+1 installments correctly during charge-off activity. If a chargeback comes, an N+1 installment is created, and N+1 installments are not affected by charge-off activity.

Accounting follows the rules defined with charge-off, and relevant account changed events are sent. GL entry columns include Interest portion, Interest income charge off, Fee Receivable, charge-off interest income, and Interest Receivable.

### Accrual processing after charge-off

The Apply periodic accrual business step does not work on charged-off loans. When interest recognition from disbursement date is TRUE and this is the first time the charge-off transaction is created, no accrual transaction is generated immediately because there is no difference between accrued interest and payable interest. When accrual recalculation is triggered after charge-off, the accrual or accrual adjustment transaction date is the charge-off transaction date.

When a charge-off is backdated, accrual entries are reversed as follows:

- When interest recognition from disbursement date is TRUE and the charge-off transaction date is 13th Jan, accrual entries with transaction dates 13th Jan and 14th Jan must be reversed.
- When interest recognition from disbursement date is FALSE and the charge-off transaction date is 13th Jan, accrual entries with transaction date 14th Jan must be reversed.

When a loan is charged off, accrual processing depends on the loan type and interest recognition setting:

- When a progressive loan is charged off, the actual not yet accrued daily interest must be immediately recognized and an accrual transaction posted if there is any payable non-recognized interest.
- When a cumulative loan is charged off, the actual not yet accrued daily interest must be immediately recognized and an accrual transaction posted if there is any payable non-recognized interest.
- When interest recognition from disbursement date is FALSE, the missing daily interest accrual must be calculated and created because accrual will not be done anymore after charge-off.

When a charged-off progressive loan has a backdated repayment or an earlier repayment reverted, accruals are recalculated real-time and an accrual or accrual adjustment transaction is posted if applicable. If charge-off amounts changed, the new accrual or accrual adjustment transaction is created on the charge-off date before the charge-off transaction itself timestamp-wise.

### Backdated transactions and reverse-replay

Backdated repayment or other monetary activity triggers reverse-replay of all transactions and the charge-off transaction. Monetary activity after charge-off is not reprocessed; the system uses existing repayment periods and processes the transaction as if the loan does not do interest recalculation.

When an overpaid loan receives a charge:

- If the overpaid amount matches the charge amount, the loan gets closed.
- If the overpaid amount is lower than the charge amount, the loan gets active (reopened).
- The new maturity date is the date of the charge due date.
- Delinquency period and breach period are created if any outstanding balance appears on the loan after adding a charge.

Charge-off scenarios:

- S1 charge-off on due date scenario covers charge-off on the due date.
- S5 charge-off after one installment is overdue scenario is listed.

### Worked examples

Regular charge-off before maturity. A user of a progressive loan product sees a principal of 1,000.00, an annual interest rate of 12 percent, 30-day months, and three monthly installments due on 1 February, 1 March and 1 April. The first installment of 340.00, made of principal 330.00 and interest 10.00, is paid on 1 February, leaving 670.00 outstanding. Before the next installment is due, the user posts a charge-off on 15 February. Because the charge-off happens before maturity, the full outstanding balance becomes collectible on the charge-off date, interest is calculated only to 15 February, and the remaining installments are removed. The figures are illustrative. This example shows that a pre-maturity charge-off collects the whole remaining balance plus interest to the charge-off date and drops future installments.

| Date | Event | Principal | Interest | Total | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 Feb | Installment paid | 330.00 | 10.00 | 340.00 | 670.00 |
| 15 Feb | Charge-off | 670.00 | 3.13 | 673.13 | 0.00 |
| — | Future installments removed | — | — | — | 0.00 |
| Total |  | 1,000.00 | 13.13 | 1,013.13 |  |

Charge-off with interest recalculation. A progressive loan with interest recalculation turned on uses a principal of 1,000.00, an annual interest rate of 12 percent, and 30-day months. The current period runs from 1 February to 1 March with 670.00 outstanding and full-period interest of 6.00. The user posts a charge-off on 11 February. Interest is calculated as the period interest divided by the days in the period, multiplied by the days from the period start, exclusive, to the charge-off date, inclusive: 6.00 divided by 30 multiplied by 10 equals 2.00. The difference between the original interest and the new interest, 4.00, is added to the principal due, the current period's due date becomes 11 February, and all future periods are removed. This example shows how a partial-period charge-off reprices interest and shifts the uncharged interest into the principal due.

| Step | Amount |
| --- | --- |
| Full-period interest | 6.00 |
| Days in period | 30 |
| Days to charge-off date | 10 |
| Interest till charge-off | 2.00 |
| Charge-off amount (principal 670.00 plus interest 2.00) | 672.00 |
| Balance after charge-off | 0.00 |

Accelerate maturity at charge-off. A progressive, interest-bearing loan uses the accelerate maturity date charge-off behavior, with a principal of 1,000.00, an annual interest rate of 12 percent, 30-day months, and monthly installments. The first installment of 340.00, made of principal 330.00 and interest 10.00, is paid on 1 February, leaving 670.00 outstanding. The next installment is due on 1 March, but the user posts a charge-off on 1 March, so that installment's due date is pulled forward to the charge-off date. The full balance becomes due: principal 670.00 plus interest of 6.70 for the period, a total of 676.70, bringing the balance to 0.00 and removing later installments. With regular charge-off instead, future installments would simply be removed without pulling the next installment's due date to the charge-off date. This example shows that accelerate maturity pulls the next installment's due date to the charge-off date and collects it as part of the charge-off.

| Date | Event | Principal | Interest | Total | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 Feb | Installment paid | 330.00 | 10.00 | 340.00 | 670.00 |
| 1 Mar | Charge-off, maturity accelerated | 670.00 | 6.70 | 676.70 | 0.00 |
| — | Later installments removed | — | — | — | 0.00 |
| Total |  | 1,000.00 | 16.70 | 1,016.70 |  |

Charge-off reversal and backdated activity. A loan of 1,000.00 is charged off on 20 January, with interest of 6.33 calculated to the charge-off date, leaving a balance of 0.00 and the charge-off flag on. A user can reverse or add transactions dated before the charge-off date; the system reverse-replays the charge-off transaction and re-establishes the previous schedule. If a backdated repayment on 15 January fully pays the loan, the charge-off transaction is reversed and the charge-off flag is lifted. The outcome depends on the interest recognition setting: when recognition from the disbursement date is true, no immediate accrual transaction is posted on the first charge-off because accrued and payable interest match; when it is false, the missing daily interest accrual is calculated and posted immediately because accrual stops after charge-off. This example shows that reversing a charge-off restores the original schedule and that backdated repayment can lift the charge-off flag.

| Date | Event | Principal | Interest | Balance after event |
| --- | --- | --- | --- | --- |
| 1 Jan | Disbursement | — | — | 1,000.00 |
| 20 Jan | Charge-off posted | 1,000.00 | 6.33 | 0.00 |
| 3 Mar | Charge-off reversed | — | — | 1,000.00 |
| 1 Feb | Original installment reinstated | 500.00 | 10.00 | 500.00 |
| 1 Mar | Original installment reinstated | 500.00 | 5.00 | 0.00 |
