# Interest Rates by Balance Status

Interest rates by balance status let you calculate interest on current principal balance only, excluding past due principal. Current principal balance is total principal balance minus past due principal balance. You can configure a separate interest rate for past due principal balance at the loan product level. The option to not calculate interest on past due principal balances defaults to off and is available only for progressive loans when interest recalculation is enabled.

Configuration storage:

| Level | Table | Field |
| --- | --- | --- |
| Loan product | m_product_loan_recalculation_details | LoanProductInterestRecalculationDetails |
| Loan | m_loan_recalculation_details | LoanInterestRecalculationDetails |

Limits:

- The option to not calculate interest on past due principal balances is limited to advance repayment strategy type.
- Floating rate is not supported; interest modification can be used as a workaround.

When a loan has "Do not calculate interest on past due principal balances" enabled under the advance repayment strategy, interest accrues only on the current principal balance, which is the total principal balance minus the past due principal balance. The figures are illustrative: a loan of 1,000.00 at 12% per year (1% per 30-day month) with three monthly installments; the customer misses the first installment, so 400.00 of principal becomes past due while the total principal balance remains 1,000.00.

| Installment | Open total principal | Past due principal | Current principal | Interest due | Principal paid | Close total principal |
| --- | --- | --- | --- | --- | --- | --- |
| 1 (missed) | 1,000.00 | 0.00 | 1,000.00 | 10.00 | 0.00 | 1,000.00 |
| 2 | 1,000.00 | 400.00 | 600.00 | 6.00 | 400.00 | 600.00 |
| 3 | 600.00 | 400.00 | 200.00 | 2.00 | 200.00 | 400.00 |

Interest for installment 2 is 6.00 on the 600.00 current principal, not 10.00 on the 1,000.00 total principal, so the missed first installment does not change the second installment's interest.
