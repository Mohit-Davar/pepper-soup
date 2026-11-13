# Interest-Bearing Loan Products

## Interest-bearing loan products

Long-Term Interest-Bearing Loan supports complex amortization schedules, interest calculations, and flexible repayment terms for long-duration lending. Progressive Schedule provides enhanced schedule handling for flexible repayment timelines.

## Progressive schedule capabilities

The progressive schedule strategy supports interest rate recalculations, all other types of charges, planned tranches, FLAT type interest calculation, performance improvements, and moratorium parameters.

The effective rate limit is:

- 0.09995, and it can change.

## Progressive schedule limitations

The progressive schedule strategy does not support floating rates, individual term and interest rate definition for full term tranches, variable installments, fixed EMI options, top-up loan options, or collateral options.

> **Note:** Interest pause is forbidden for a progressive loan with interest recalculation enabled and an interest rate of zero.

## Iteration rules

Iteration applies only to interest-bearing loan products. It does not apply to non-interest-bearing loans, S1 interest split loans, S1.1 backdated re-aging, or when iteration is disabled.

## Loan actions

Actions on loans include generating the schedule, creating notes and calendar entries when applicable, posting to the general ledger interface module (GLIM), and saving the account link. After validations pass, the system assembles the entities and executes the actions on the loans. Undo last disbursement reverts the last disbursement on a multidisbursal loan.

## Charge-off rules

Charge-off rules determine when a loan can be charged off and what happens to its balance.

Charge-off rules:

- Charge-off is prevented if there is any transaction after the charge-off date, except reversed transactions.
- The charge-off transaction is reversed if the amount balance becomes zero.
- The final balance is $0.00 after the last repayment.

## Chargeback behavior

When a chargeback (CBR) is replayed and the overpayment amount is not lower than the CBR amount, the system reflects the overpayment as credit on the EmiModel and calculates interest based on the outstanding amount. A CBR behaves like a chargeback, so the actual current installment EMI gets increased.

## First installment interest recalculation

The system recalculates interest on the first installment each day until the loan reaches its maturity date.

When the CBR amount is more than the overpayment amount, the system credits the loan schedule with the difference between the CBR amount and the overpayment amount.

- In this situation, the difference is 100.

## Penalty accrual

Penalty accrual is created during close of business (COB), the nightly job that posts interest and fees.

During COB, only accrual activity is reverse-replayed, and the penalty allocation is added to it.

- No new accrual is created during COB.
- The existing accrual for interest is not reverse-replayed to allocate the penalty amount.

## Worked examples

A progressive interest-bearing loan product is configured with interest recalculation enabled and an annual interest rate of 0.00%. The principal is 1,000.00 and the term is 3 monthly installments with 30-day months. The figures are illustrative. When a request attempts to add an interest pause to this loan, the product forbids the change because an interest pause is not permitted when interest recalculation is enabled and the interest rate is zero.

| Step | Setting | Value |
| --- | --- | --- |
| 1 | Product type | Progressive interest-bearing |
| 2 | Annual interest rate | 0.00% |
| 3 | Interest recalculation | Enabled |
| 4 | Requested action | Add interest pause |
| 5 | Result | Forbidden |

The example shows that the system rejects an interest pause when recalculation is enabled and the rate is zero, protecting the repayment schedule.

A progressive interest-bearing loan has a principal of 1,000.00, a 12.00% annual flat interest rate, and 2 monthly installments with 30-day months. The figures are illustrative. Monthly interest is 10.00 and monthly principal is 500.00, so each normal installment is 610.00. After the first installment, the outstanding balance is 500.00. The customer holds an overpayment of 100.00. A chargeback (CBR) of 200.00 is posted. Because the CBR amount is greater than the overpayment, the difference of 100.00 is credited to the loan schedule, and the current installment EMI is increased.

| Installment | Interest | Principal | EMI before CBR | EMI after CBR | Balance after |
| --- | --- | --- | --- | --- | --- |
| 1 | 10.00 | 500.00 | 610.00 | 610.00 | 500.00 |
| 2 | 10.00 | 500.00 | 610.00 | 710.00 | 0.00 |
| Total | 20.00 | 1,000.00 | 1,220.00 | 1,320.00 |  |

The example shows that when a CBR exceeds the overpayment, the difference is credited to the schedule and the current installment EMI is increased so the loan still repays to zero.

A progressive loan product is configured with one tranche of 1,000.00. Two disbursements are posted: 700.00 and 300.00. The figures are illustrative. Because the product allows only one tranche but two disbursements exist, the system rejects a request to undo the last disbursement. The loan state remains unchanged and the disbursement stays posted.

| Step | Setting | Value |
| --- | --- | --- |
| 1 | Configured tranches | 1 |
| 2 | Tranche amount | 1,000.00 |
| 3 | Disbursement 1 | 700.00 |
| 4 | Disbursement 2 | 300.00 |
| 5 | Requested action | Undo last disbursement |
| 6 | Result | Rejected |

The example shows that undoing a disbursement is forbidden when the number of disbursements exceeds the configured tranches on a progressive loan product.
