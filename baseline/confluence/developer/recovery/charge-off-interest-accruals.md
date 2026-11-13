# Charge-Off Interest Accruals

## Charge-off interest accrual behaviour

Interest accrual stops when a loan moves to charge-off state. Future interest on the schedule changes to $0, and interest projections on future periods are removed. Interest on the current period decreases proportionally.

Interest-bearing products can suspend interest accrual once a loan charges off.

- A setting for interest-bearing products suspends interest accrual once a loan charges off.

## Charge-off behaviour options

Charge-off behaviour options are Regular (default), Zero interest after charge-off, and Accelerate maturity to charge-off date. The option is stored with the product definition as a field on the loan product, and loan product configuration is stored on the loan level.

## Interest calculation at charge off

Interest accrues until the charge-off date. The period from date is exclusive and the charge-off date is inclusive. Interest till the charge-off date is calculated as `total interest of the period / number of days of the period * number of days till charge-off date`.

With zero interest after charge off, interest becomes zero after charge off and new interest is calculated for the partial period on the current installment until the charge-off date. Principal due on the period increases by the difference between the original interest of the period and the new interest after charge-off. On the last unpaid installment, principal due is set to the remaining loan balance.

Charge-off behaviour applies only to progressive loan products where interest is not zero; interest is calculated until the charge-off date. If the loan product is not progressive, does not have interest, or interest recalculation is not enabled, only regular charge-off behaviour is supported.

For interest recalculation loans, only the way of calculating interest until the charge-off date changes; the rest is the same.

For a progressive interest-bearing loan with interest recalculation enabled and zero interest after charge-off strategy, the charge-off transaction must contain the proper interest portion calculated until the charge-off date.

When an early repayment closes and marks a period fully paid, interest for the remaining days in that period is still recognized and reflected on the next period, and the system calculates charged interest until the charge-off date and reflects it on the charge-off transaction.

## Reversing a charge off

Reversing a charge off restores the original schedule and interest, resumes accruals, and re-adds accruals for past items. Any repayment reversal before charge off reverses or replays the charge off and increases the charged off principal and interest amounts.

## Scheduled jobs and charged-off loans

Scheduled jobs skip loans that have a charge-off transaction which has not been reverted. Interest accrues again once the charge-off is reversed. These jobs include Accrual Activity Posting, Add Accrual Transactions, Add Accrual Transactions For Loans With Income Posted As Transactions, Add Periodic Accrual Transactions, and Recalculate Interest for Loans.

Interest accrual rules for charged-off loans:

- No interest is added for a charged-off loan with 0 interest.
- Interest is added when a loan has a reverted charged-off transaction.

## Transaction processing around charge off

When a repayment or other monetary activity happens after charge off, transactions are processed without interest recalculation. Before charge off, interest is recalculated for early or late repayment.

Transaction processing differs depending on timing relative to charge off:

- Before charge off, EmiCalculator recalculates interest for early or late repayment via AdvancedPaymentScheduleTransactionProcessor#handlingPaymentAllocationForInterestBearingProgressiveLoan.
- After charge off, AdvancedPaymentScheduleTransactionProcessor#processPaymentAllocation is used instead of the interest recalculation method.

If a backdated repayment or other monetary activity happens, transactions are reprocessed using AdvancedPaymentScheduleTransactionProcessor.reprocessProgressiveLoanTransactions, which returns ProgressiveLoanInterestScheduleModel to call EMICalculator and calculate due interest for the current period.

Reprocessing behaviour:

- Anything that happened before the charge-off transaction can and should recalculate interest.

## Charge-off accounting mappings

You can map charge-off reason codes to expense GL accounts using an Advanced Accounting Rule. Each charge-off reason code can map to only one GL account, while the same GL account can serve multiple charge-off reasons. Backend validation applies, and only Expense accounts can be configured. A charge-off reason code value used as an Advanced Accounting Rule on any loan product cannot be deleted.

Required fields for the Advanced Accounting Rule mapping:

| Field | Requirement |
| --- | --- |
| chargeOffReasonCodeValueId | Must be a valid, existing id of a charge-off reason code value |
| expenseGLAccountId | Must be a valid, existing Expense GL account id |

## Charge-off reason configuration APIs

These mappings are part of the loan product create and update request and are returned when you fetch loan product details. Use the loan product template API to see all available charge-off reason code values.

| API | Returns |
| --- | --- |
| GET /v1/loanproducts/template | All configuration options needed to create a new loan product, including charge-off reason options |
| GET /v1/loanproducts/{loanProductId}?template=false | Loan product details without template details |
| GET /v1/loanproducts/{loanProductId}?template=true | Loan product details and all configuration options needed to update the loan product |

Each charge-off reason mapping contains:

- chargeOffReasonCodeValueId — the code value ID of the charge-off reason
- expenseGLAccountId — the GL account ID of the expense account

You can also retrieve charge-off reason code values using CodeValueReadPlatformService.retrieveCodeValuesByCode("ChargeOffReasons").

## Charge-off behaviour on loan products

Charge-off behaviour is set on a loan product and applies to every loan account created from that product. Changing the behaviour on the product does not affect existing loan accounts. If you set it, the system validates the value against the allowed ENUM names.

## Worked examples

A progressive loan with interest recalculation is charged off mid-period. The figures are illustrative: a principal of 1,000.00, an annual interest rate of 12% (1% per month), 3 monthly installments, and 30-day months. Interest accrues until the charge-off date; the charge-off date is inclusive and the period start is exclusive. Interest for the current period is prorated as (period interest / period days) × days until charge-off, and the difference between the original and prorated interest is added to the principal due. All future installments have interest set to 0, and the removed interest is added to their principal due. If interest recalculation is not enabled, the full period interest is removed instead of the prorated amount. The table shows the adjusted schedule after charge-off.

| Period | Due date | EMI | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 | 340.02 | 330.02 | 10.00 | 669.98 |
| 2 | 60 | 340.02 | 336.67 | 3.35 | 333.31 |
| 3 | 90 | 333.31 | 333.31 | 0.00 | 0.00 |
| Total |  | 1013.35 | 1000.00 | 13.35 |  |

Charge-off accounting entries are posted by charge-off reason. A charge-off transaction with principal of 100.00, interest of 10.00, fees of 5.00, and penalty of 2.00 debits the principal to the expense GL account mapped to the reason code; interest, fees, and penalty debit their respective charge-off income or fee accounts. The credit side goes to Loans Receivable for principal and to Fee Receivable or Penalty Receivable for the other portions. Without an advanced accounting rule, reason code fraud maps to Credit Loss/Bad Debt Fraud and reason code delinquent maps to Credit Loss/Bad Debt. When an advanced accounting rule is configured, the configured GL account takes priority over the default mapping.

| Portion | Amount | Reason code | Debit account | Credit account |
| --- | --- | --- | --- | --- |
| Principal | 100.00 | Fraud | Credit Loss/Bad Debt Fraud | Loans Receivable |
| Interest | 10.00 | Fraud | Interest income charge off | Fee Receivable |
| Fees | 5.00 | Fraud | Fee Charge off | Fee Receivable |
| Penalty | 2.00 | Fraud | Fee Charge off | Penalty Receivable |
| Principal | 100.00 | Delinquent | Credit Loss/Bad Debt | Loans Receivable |
| Interest | 10.00 | Delinquent | Interest income charge off | Fee Receivable |
| Fees | 5.00 | Delinquent | Fee Charge off | Fee Receivable |
| Penalty | 2.00 | Delinquent | Fee Charge off | Penalty Receivable |

An early repayment can close a period before its end, yet interest for the remaining days of that period is still recognized and must appear on the charge-off transaction. The figures are illustrative: a principal of 1,000.00, an annual interest rate of 12%, daily interest calculation, and 30-day months. A repayment on day 15 fully repays period 1, and the loan is charged off on day 30. Interest for days 16 through 30 of period 1 is calculated and carried on the charge-off transaction even though the period was already marked fully paid.

| Period | Days covered | Interest recognized | Reflected on |
| --- | --- | --- | --- |
| 1 | 1-15 | 4.93 | Early repayment |
| 1 | 16-30 | 4.93 | Charge-off transaction |
| Total charge-off interest portion |  | 4.93 |  |

See also: [Charge-Off Balances](confluence-link:Charge-Off%20Balances).
