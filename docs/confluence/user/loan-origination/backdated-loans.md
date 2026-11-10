# Backdated Loans

## Backdated Loans

### Backdated loan creation

You can create a backdated loan with a business date of 01-11-2024 and a loan creation date of 01-01-2022.

### Allowed backdated transaction types

You can backdate monetary activities on a loan account, including disbursements, refunds, repayments, fee and charge adjustments, goodwill credits, charge-offs, interest waivers, interest accrual activity, interest refunds and reversals, and interest rate changes.

### Backdated schedule adjustments

You can backdate a loan schedule adjustment through the API. Charge-off backdating is also supported through the API. Backdating a reduced interest rate and backdating a pause or resume of interest are not supported through the API.

### Backdating rules and effects

Backdated transactions apply only when they are the latest transaction in the loan life cycle, and no transaction can be executed on a future date. A backdated transaction or reversal triggers reverse replay of the loan account, and the system updates the loan status accordingly.

The following backdated transactions are supported:

- A merchant-issued refund is created.
- A goodwill credit is reversed and replayed with the same external id.

### Accrual activity processing

Accrual activity processing reverses and replays accrual activity consistently, and it reverses and replays just once for each transaction. You enable accrual activity on a loan product using the Accounting tab checkbox. When a transaction is reverse-replayed, the system copies the reverted transaction external id to the replayed new transaction and clears the external id on the reverted transaction. Updating the transaction date to the date when the period got early repaid prevents the accrual from reversing again and creating a new Accrual Activity.

> **Note:** The system does not create both a LoanAdjustTransactionBusinessEvent that reverts a transaction and a LoanAdjustTransactionBusinessEvent that reverse-replays the same transaction.

### Loan product configuration

A loan product can be configured as progressive and interest bearing with interest recalculation enabled. The affected loan product configuration is progressive, interest bearing, has interest recalculation set to true, default payment allocation is LAST_INSTALLMENT, and Accrual Activity is enabled on the loan product via the Accounting tab checkbox. The flag is set when disbursement or reage changes the number of terms. Calculate the number of terms before the action is executed and after the action is executed; if they differ, add the flag.

The following loan product configurations apply:

- Loan product configuration DELT uses interest rate 9.99%, days in month ACTUAL, days in year ACTUAL, and number of repayments 6.
- The issue does not affect loan product configuration with days in year 360 and days in month 30.
- For ACTUAL / ACTUAL, the number of days in the period should be taken directly instead of calculating days in the month and multiplying with the repay every month multiplier.

The following automatic interest refund behaviour applies:

- The affected loan product configuration makes an automatic interest refund transaction when a merchant issued refund is created.

The following repayment schedule behaviour applies:

- The 2nd disbursement should show the same outstanding amount on each installment except the last installment, which will have an adjusted amount.

### Rate factor formulas

The rate factor formula depends on how often repayments fall due. Monthly, weekly and daily periods each use a different formula, while yearly and whole-period options follow the default period behaviour. The formula also adjusts for the actual number of days in the period compared with the calculated number of days in the period.

| Repayment period | Rate factor formula |
| --- | --- |
| Monthly | 1+(rate of interest*(repaid every *days in month /days in year)*actual days in period/calculated days in period) |
| Weekly | 1+(rate of interest*(7*repaid every /days in year)*actual days in period/calculated days in period) |
| Daily | 1+(rate of interest*(repaid every /days in year)*actual days in period/calculated days in period) |

EMI is calculated by deducting the downpayment principal from the principal balance even when the downpayment transaction is not paid. When the loan falls in the same year, EMIs match, period interests match, early and late payments match, and preclosure calculation matches.

During backbook migration there is no down-payment, no chargeback, there are N+1 situations, and fees are mostly added after the maturity date.

In Fineract the from date is excluded and the end date is included, so a period's first day is excluded, causing the number of days in a particular month and year to differ from Temenos. For example, for the period from 13 December 2023 to 13 January 2024, Fineract recognizes 18 days in 2023 and 13 days in 2024, while Temenos recognizes 19 days in 2023 and 12 days in 2024.

### Interest calculation start date

The interest calculation start date differs between Temenos and Fineract.

| System | First day of interest |
| --- | --- |
| Temenos | Disbursement date |
| Fineract | Disbursement date + 1 |

### Projected interest and repayment schedule approaches

Fineract and Temenos use different projected interest calculation and repayment schedule approaches. Temenos calculates and reflects the repayment schedule as if the current period due got paid. Fineract calculates and reflects the repayment schedule as if all past due periods got paid.

Interest for a period uses this formula:

- outstanding total principal * nominal interest rate / number of days in year * number of days in period

### Fineract vs Temenos interest mismatches

Interest and EMI amounts do not always match between Fineract and Temenos for backdated loans. Mismatches occur for specific repayment periods, disbursements, installments, and adjustments, and can be as small as one cent.

The following mismatches occur between Fineract and Temenos:

- EMI matches between Fineract and Temenos.
- Interest amounts for the first and second repayment periods match when the first period is past due and the second period is due.
- Future installment interest amounts do not match.
- Interest for the third repayment period does not match.
- Interest from second periods does not match.
- Interest from third periods does not match.
- The last but one installment period interest does not match by 1 cent.
- The last installment EMI differs by 1 cent.
- The EMI of the last installment does not match.
- Adjust to last has differences.
- EMI after the second disbursement does not match.
- Period interest does not match.

Additional observed differences include:

- Temenos does not recalculate interest for the current period after early repayment, so the second payment interest does not match.
- Early payment interests do not match, probably because Temenos does not recalculate them, so the second payment interest also does not match.
- Temenos calculates interest differently when the whole loan is backdated and the current date is after the maturity date.
- In a multi-disbursement scenario, the total billed amount in Temenos is less than the disbursed amount with 3 cents missing (7.82 + 7.97 + 8.09 + 8.22 + 8.39 + 8.51 = 49).

> **Note:** One scenario could not be reviewed because the exact use case could not be replicated in Temenos.

### One year cycle matching

When a loan cycle falls within one year, EMI and period interest match for S5 schedules at disbursement and after all four repayments, and EMI and period interest match generally for one-year cycles. For S6 schedules, last installment interest and EMI do not match after disbursement, while payment interest and preclosure calculation match after repayments.

### S7 schedule scenarios

S7 schedule scenarios cover interest differences after disbursement and preclosure, EMI mismatches, and the conditions under which Fineract matches Temenos.

S7 scenarios show the following differences:

- After the first disbursement, interest differs after 10-11-2024 regarding how Temenos calculates interest for a future date.
- After the second disbursement, interest differs by 1 cent, the last EMI differs, and interest differs after the current date.
- After preclosure, interest differs by 1 cent, the last EMI differs, and the preclosure calculation differs possibly because of calculation after the current date.

Schedule and payment behaviour follows these rules:

- Schedule and payment calculation match only till the current date.
- The last installment EMI does not match between Fineract and Temenos.
- If days in year is 365, Fineract matches; otherwise it does not match.

Rescheduling behaviour follows these rules:

- One due date reschedule moves the due date from 2/1/24 to 3/1/24.
- Off due date reschedule moves the due date from 3/1/24 to 4/15/24.
- During reschedule of a period due date, the EMI must not change; only the due date moves and interest is recalculated.

Outstanding amount is projected as follows:

- The projected total outstanding amount is calculated on the fly based on total disbursed amount plus total fee plus total penalty plus total interest.
- Each period deducts the amount due from total outstanding amount to get the projected total outstanding after each period.

Rate factor approaches for rescheduled periods:

| Approach | Formula |
| --- | --- |
| Rescheduled period rate factor | interest rate / days in year * days in month * actual days in period / calculated days in period |
| Correct rate factor approach | calculate full months between from date and due date, then add ratio of partial period as number of days / actual days in the month of the partial period from date |

> **Note:** A Temenos sample is not yet available to compare against the S7 screenshot of values after the second disbursement.

For S9 after disbursement, the calculated accrual amount in Temenos till Nov 19 is 4.98.

When m_loan_charge_paid_by is not present after reversal for some credit transactions, the transaction summary report does not include the fees portion for those credit transactions.

### Worked examples

A loan officer creates a loan with a backdated creation date. The business date is later than the creation date, but because no disbursement or repayment has been posted yet, the backdate is allowed and the schedule starts from the creation date. The figures in this example are illustrative. The setup is a principal of 1,000, an annual interest rate of 12%, three monthly installments, and 30-day months. If the product uses ACTUAL/ACTUAL day count instead of 30/360, interest for each period uses the actual number of days in that period rather than 30.

| Period | Due date | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 month | 1,000.00 | 340.00 | 10.00 | 330.00 | 670.00 |
| 2 | 2 months | 670.00 | 340.00 | 6.70 | 333.30 | 336.70 |
| 3 | 3 months | 336.70 | 340.07 | 3.37 | 336.70 | 0.00 |
| Total |  |  | 1,020.07 | 20.07 | 1,000.00 |  |

A repayment is posted with a date earlier than the current business date. Because it is the latest transaction in the loan life cycle, the backdate is allowed and the system reverse-replays the account, recalculating interest for the affected period as if the payment had arrived on time. The setup is a principal of 1,000, an annual interest rate of 12%, three monthly installments, and 30-day months. The second installment is backdated to its due date. If the payment date were not backdated, ten extra days of interest on the 670.00 balance would add about 2.23 to the interest charge.

| Period | Due date | Payment date | Opening balance | Payment | Interest | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 month | 1 month | 1,000.00 | 340.00 | 10.00 | 670.00 |
| 2 | 2 months | 2 months (backdated) | 670.00 | 340.00 | 6.70 | 336.70 |
| 3 | 3 months | 3 months (backdated) | 336.70 | 340.07 | 3.37 | 0.00 |
| Total |  |  |  | 1,020.07 | 20.07 |  |

The interest rate on an active loan is changed with a backdated effective date. The system recalculates interest from that date while keeping earlier periods at the old rate. The setup is a principal of 1,000, an original annual interest rate of 12% for the first month, then 9% from the second month, three monthly installments, and 30-day months. This shows that a backdated rate change reprices only the periods from the effective date onward.

| Period | Rate | Opening balance | Payment | Interest | Principal | Closing balance |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 12% | 1,000.00 | 340.00 | 10.00 | 330.00 | 670.00 |
| 2 | 9% | 670.00 | 340.00 | 5.03 | 334.97 | 335.03 |
| 3 | 9% | 335.03 | 337.54 | 2.51 | 335.03 | 0.00 |
| Total |  |  | 1,017.54 | 17.54 | 1,000.00 |  |

A fee is added to a loan and then reversed with a backdated date. Because the reversal is the latest transaction, it is allowed and the balance returns to the amount before the fee. The setup is a loan balance of 1,000, a fee of 20.00, and the reversal posted backdated to the fee date. If the field showing who paid the charge is missing after the reversal, the transaction summary report excludes the fees portion for that credit transaction.

| Transaction | Date | Amount | Balance |
| --- | --- | --- | --- |
| Fee added | 1 month | 20.00 | 1,020.00 |
| Fee reversed (backdated) | 1 month | -20.00 | 1,000.00 |
| Repayment | 2 months | -340.00 | 660.00 |

See also: [Interest Calculation: EMI Calculation](confluence-link:Interest%20Calculation#emi-calculation).
