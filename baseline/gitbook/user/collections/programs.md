# Collections Programs

A recovery payment lets you collect money on a loan account that is written off. The loan balance stays at zero and the account remains written off after the payment. You can reverse a recovery payment, and its accounting entry is a mirror of the original recovery payment entry.

Recovery payment rules:

- The total recovery payment cannot exceed the amount of the written-off transaction.
- You can backdate a recovery payment, but not to a date before the write-off date.

Working capital loan settings:

- Payment type is optional for monetary transactions on working capital loans.
- You can provide a payment type id, which is assigned to and stored with monetary transactions on working capital loans.
- You can override delinquency bucket configuration during loan creation for working capital loans.
- You can override breach bucket configuration during loan creation for working capital loans.
- Loan level overrides for delinquency bucket and breach bucket take precedence over product level defaults.
- Updating repayment percent affects delinquency and breach evaluation for working capital loans.

Working capital loan account balance field:

| Field | Description |
| --- | --- |
| Total recovery payment | The total amount recovered on the written-off loan account. |

A working capital loan with an original principal of 1,000 is written off. The write-off reduces the loan balance to 0 and sets the loan status to Written-off. The borrower later makes a recovery payment of 400; the payment type is optional for this transaction. The figures in this example are illustrative.

| Step | Action | Payment amount | Cumulative recovery | Loan balance | Loan status |
| --- | --- | --- | --- | --- | --- |
| 1 | Write-off | 0.00 | 0.00 | 0.00 | Written-off |
| 2 | Recovery payment | 400.00 | 400.00 | 0.00 | Written-off |

The recovery payment stays within the written-off amount, so it is accepted. The loan balance remains 0 and the loan remains Written-off.

The 400 recovery payment is reversed. The reversal posts a mirror accounting entry, and the payment type remains optional for the reversal.

| Step | Action | Payment amount | Cumulative recovery | Loan balance | Loan status |
| --- | --- | --- | --- | --- | --- |
| 1 | Recovery payment | 400.00 | 400.00 | 0.00 | Written-off |
| 2 | Reversal of recovery | -400.00 | 0.00 | 0.00 | Written-off |

Reversing the payment mirrors the original entry and leaves the balance at 0 and the status at Written-off.
