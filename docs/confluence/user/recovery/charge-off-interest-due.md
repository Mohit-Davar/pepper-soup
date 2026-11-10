# Charge-Off Interest Due

## Charge-Off Interest Due

Charge-off interest due handles interest balances during automated charge-off so accounting entries match the defined accounting policy. Accounting entries must be handled for interest charge-off. It applies to interest-bearing loans that use the progressive allocation strategy.

The system posts charge-off accounting entries as follows:

- Interest due at charge-off charges off to interest income charge-off.
- Interest recoveries post to the recoveries GL.
- Collections on charged-off interest balances post as charge-off recoveries to the GL.

Charge-off mappings depend on the charge-off type:

- Charge off Fraud maps the interest portion to interest income charge-off, the fees portion to fee charge-off with fee receivable and charge-off fees income, and the penalty portion to fee charge-off with penalty receivable and charge-off penalty income.
- Charge off Non Fraud maps the interest portion to interest income charge-off, the fees portion to fee charge-off with fee receivable and charge-off fees income, and the penalty portion to fee charge-off with penalty receivable.

Other charge-off mappings are:

- Charge adjustment maps the fees portion to fee income with other credit liability and income from fees, and the penalty portion to fee income with fee charge-off and income from penalties.
- OCA repayment maps the interest portion, fees portion, unallocated credit, and penalty portion to other receivables with recoveries and fund source or advance accounting, except unallocated credit, which maps to other credit liability with fund source or advance accounting.

Repayment transactions on a charge-off loan account post these accounting entries:

- A debit to GLCode 145023 Suspense/clearing account (Fund source, Liability, Allocation Type Prin, Fees, and Penalty and excess).
- A credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type Prin).
- A credit to GLCode 245000 Other Credit liability (Overpayment Liability, Liability, Allocation Type excess).
- A credit to GLCode 744008 recoveries (Income from Recovery Repayment, Income, Allocation Type Penalty).

Validation and restrictions include:

- Validation of the charge-off transaction includes confirming it appears in the list of transactions.
- From the time of charge-off, no more disbursement is allowed.

A loan officer reviews an interest-bearing loan that uses the progressive allocation strategy. The principal is 1,000.00 and the annual interest rate is 12%. With 30-day months, three months of interest accrue to 30.00, which is the interest due when the officer initiates a non-fraud charge-off. From that moment the system blocks any further disbursement. The figures in this example are illustrative. If the charge-off reason were fraud instead, the interest portion would still post to Interest income charge off; only the fee and penalty portions would use additional charge-off income accounts.

| Step | Account | Debit | Credit |
| --- | --- | --- | --- |
| Interest due charged off | Interest income charge off (744003) | 30.00 |  |
| Loan asset reduced | Loans Receivable (112601) |  | 30.00 |
| Totals |  | 30.00 | 30.00 |

This shows that interest due at charge-off moves to the interest income charge-off income account and the loan asset is reduced by the same amount, keeping debits and credits equal.

After the charge-off, the borrower pays 15.00 toward the previously charged-off interest of 30.00. The loan officer records the collection on the charged-off account. Because no further disbursement is allowed after charge-off, the payment is treated as a recovery and posted using the Other receivables and recoveries accounting treatment.

| Step | Account | Debit | Credit |
| --- | --- | --- | --- |
| Payment applied to charged-off interest | Other receivables (145800) | 15.00 |  |
| Recovery recognized | Recoveries GL |  | 15.00 |
| Totals |  | 15.00 | 15.00 |

This shows that collections on charged-off interest post to Other receivables and the recoveries GL, reducing the charged-off interest balance and supporting correct charge-off recovery accounting.
