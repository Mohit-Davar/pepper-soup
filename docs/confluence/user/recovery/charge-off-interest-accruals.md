# Charge-Off Interest Accruals

## Charge-off behaviour

Charge-off behaviour controls how interest accrues after a loan is charged off. The options are Regular (default), Zero interest after charge-off, and Accelerate maturity to charge-off date. Charge-off behaviour applies only to Progressive loan products where interest is not zero; interest is calculated until the charge-off date. If the loan product is not progressive, does not have interest, or does not have interest recalculation enabled, only Regular charge-off behaviour is supported. If the charge-off behaviour variable is not set, the default is Regular.

Charge-off behaviour is configured on the loan product:

- It is stored with the product definition as a new field on the loan product.
- The Charge-off behaviour selector appears on the loan product settings page after the down payment section.
- When a loan is opened, the Account details section shows the charge-off behaviour value.
- Charge-off behaviour cannot be updated on loan level.
- If charge-off behaviour changes on the product, existing loan accounts remain unaffected.
- If the charge-off behaviour variable is set, it is validated as a valid value using ENUM validation with the string name.
- Whether charge-off behaviour is supported for the loan product is validated.

## Stopping interest after charge-off

Interest accruals stop once a loan charges off. Future interest on the schedule changes to $0, and interest on the current period decreases proportionally.

## Interest calculation at charge-off

Interest up to that date is calculated for the partial period on the current installment, and future interest is set to zero. The principal due increases by the interest removed from future installments.

Interest calculation rules at charge-off:

- Interest till the charge-off date equals `total interest of the period / number of days of the period * number of days till charge-off date`.
- The period start date is exclusive and the charge-off date is inclusive.
- The charge-off date decides which period the interest belongs to.
- Principal due on the period increases by the difference between the original interest of the period and the new interest after charge-off.
- On the last unpaid installment, principal due is set to the remaining loan balance.

Loans with interest recalculation enabled:

- Only the way of calculating interest till the charge-off date changes; the rest is the same.
- No interest is added for charged-off loans with zero interest after charge-off.
- Interest is added when a loan has a reverted charged-off transaction.

> **Note:** Only loans with a charge-off transaction that has not been reverted are excluded from scheduled jobs.

## Reversing a charge-off

Reversing a charge-off restores the original repayment schedule and interest, resumes accruals for past items, and initiates the accrual job to create the accruals.

## Transactions after charge-off

Transactions after charge-off do not trigger interest recalculation. The system processes them using payment allocation instead of recalculating interest for the period.

The system applies different processing depending on when the transaction occurs:

- Before the charge-off transaction, interest recalculates for early or late repayment.
- After the charge-off transaction, the system processes existing repayment periods without interest recalculation.

If a backdated repayment or other monetary activity happens, transactions are reprocessed to calculate due interest for the current period.

## Discount amortization after charge-off

When a loan is charged off, the system performs a one-time amortization of the total deferred income as of the charge-off date.

## Charge-off accounting mappings

You can map charge-off reason codes to GL accounts using an Advanced Accounting Rule on the loan product. The rule applies to one or multiple charge-off reason codes, and each reason code can be configured only once. Only an Expense account can be selected. Backend validation runs when the mapping is saved. A reason code used in a configured Advanced Accounting Rule cannot be deleted.

When an Advanced Accounting Rule is configured for the charge-off transaction, the mapped GL account takes priority over the standard charge-off expense configuration:

- If a rule exists for the charge-off reason code, the system uses the GL account mapped to that reason code.
- If no rule exists for the charge-off reason code, the system falls back to the originally configured Charge-off Expense or Charge-off Fraud Expense account.

## Charge-off reason code configuration

A charge-off reason code maps to one expense GL account. You enter the reason code value ID and the expense GL account ID when you configure the mapping.

Configuration rules:

- The charge-off reason code value ID must be a valid, existing ID of a charge-off reason code value.
- The expense GL account ID must be a valid, existing expense GL account ID.
- The same GL account can be configured for multiple charge-off reasons.

## Worked examples

A progressive loan product with interest recalculation enabled has a principal of 1,000.00, an annual interest rate of 12 percent, and three monthly installments with 30-day months. The installments fall due on 1 February, 1 March and 1 April. The loan is charged off on 15 February, which lies inside the second period. These figures are illustrative.

| Period | Due date | EMI | Principal | Interest | Balance |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 Feb | 340.00 | 330.00 | 10.00 | 670.00 |
| 2 | 1 Mar | 340.00 | 336.87 | 3.13 | 333.13 |
| 3 | 1 Apr | 333.13 | 333.13 | 0.00 | 0.00 |
| Total |  | 1,013.13 | 1,000.00 | 13.13 |  |

The example shows that future interest is set to zero, the current period keeps only the interest for the days up to the charge-off date, and the removed interest is added to the principal due; with the zero-interest-after-charge-off setting instead, the current-period interest would also be removed entirely and added to principal.

When a loan is charged off, accounting entries are posted according to the charge-off reason rather than only the fraud flag. Suppose a charge-off involves a principal portion of 500.00, an interest portion of 50.00, a fee portion of 20.00 and a penalty portion of 10.00. If the reason is delinquent, the principal is debited to Credit Loss/Bad Debt; if the reason is fraud, it is debited to Credit Loss/Bad Debt Fraud. The interest, fee and penalty portions use the same debit and credit accounts in both cases. If an Advanced Accounting Rule maps the fraud reason to Charge-off-fraud, that account takes priority over the default fraud configuration. These figures are illustrative.

| Portion | Amount | Debit: delinquent reason | Debit: fraud reason | Debit: advanced rule for fraud | Credit account |
| --- | --- | --- | --- | --- | --- |
| Principal | 500.00 | Credit Loss/Bad Debt | Credit Loss/Bad Debt Fraud | Charge-off-fraud | Loans Receivable |
| Interest | 50.00 | Interest income charge off | Interest income charge off | Interest income charge off | Fee Receivable |
| Fees | 20.00 | Fee Charge off | Fee Charge off | Fee Charge off | Fee Receivable |
| Penalty | 10.00 | Fee Charge off | Fee Charge off | Fee Charge off | Penalty Receivable |
| Total | 580.00 |  |  |  |  |

The example shows that the charge-off reason determines the principal debit account, while an Advanced Accounting Rule overrides the default fraud mapping when one is configured.

See also: [Charge-Off Balances](confluence-link:Charge-Off%20Balances).
